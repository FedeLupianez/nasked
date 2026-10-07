import { Injectable } from '@nestjs/common';
import { FoldersService } from './folders.service';
import { CardsService } from './cards.service';
import { FieldsService } from './fields.service';
import { FieldsValuesService } from './fields-values.service';

/**
 * Fachada de los elementos (carpetas, tarjetas, campos y valores). El CRUD por
 * entidad vive en los servicios individuais; aca quedan las operaciones que
 * los cruzan.
 */
@Injectable()
export class ElementsService {
  constructor(
    private readonly foldersService: FoldersService,
    private readonly cardsService: CardsService,
    private readonly fieldsService: FieldsService,
    private readonly fieldsValuesService: FieldsValuesService
  ) { }

  /** Arbol de carpetas de una empresa, con las tarjetas de cada nivel. */
  async treeOf(id_company: number) {
    const roots = await this.foldersService.findRoots(id_company);
    return await Promise.all(roots.map(async (folder) => ({
      ...folder,
      cards: await this.cardsService.findByFolder(folder.id_folder)
    })));
  }

  /** Ficha completa de una tarjeta: campos con sus respuestas cargadas. */
  async cardWithFields(id_card: number) {
    return await this.cardsService.findById(id_card);
  }

  async createFolder(dto: Parameters<FoldersService['create']>[0]) {
    return await this.foldersService.create(dto);
  }

  async createCard(dto: Parameters<CardsService['create']>[0]) {
    return await this.cardsService.create(dto);
  }

  async createField(dto: Parameters<FieldsService['create']>[0]) {
    return await this.fieldsService.create(dto);
  }

  async setFieldValues(id_field: number, values: string[]) {
    return await this.fieldsValuesService.replaceForField(id_field, values);
  }
}
