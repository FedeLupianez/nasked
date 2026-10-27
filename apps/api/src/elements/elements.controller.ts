import { Body, Controller, Post } from '@nestjs/common';
import { JoinFolderDTO } from './dto/joinFolder.dto';
import { FoldersService } from './folders.service';

@Controller('elements')
export class ElementsController {
  constructor(
    private readonly folderService: FoldersService,
  ) { }

  @Post('joinfolder')
  async joinFolder(@Body() body: JoinFolderDTO) {
    // TODO: Definir si para unirse a una carpeta se debe estar asociado a la empresa dueña
    // o que al unirse a la carpeta automáticamente se asocie a esta
    return await this.folderService.joinToFolder(body.id_account, body.folder_token);
  }
}
