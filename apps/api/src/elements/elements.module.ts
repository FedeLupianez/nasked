import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElementsController } from './elements.controller';
import { ElementsService } from './elements.service';
import { Folders } from './folders.entity';
import { Cards } from './cards.entity';
import { Fields } from './fields.entity';
import { FieldsValues } from './fieldsValues.entity';
import { FoldersService } from './folders.service';
import { CardsService } from './cards.service';
import { FieldsService } from './fields.service';
import { FieldsValuesService } from './fields-values.service';

@Module({
  imports: [TypeOrmModule.forFeature([Folders, Cards, Fields, FieldsValues])],
  controllers: [ElementsController],
  providers: [ElementsService, FoldersService, CardsService, FieldsService, FieldsValuesService],
  exports: [ElementsService, FoldersService, CardsService, FieldsService, FieldsValuesService]
})
export class ElementsModule {}
