import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElementsController } from './elements.controller';
import { ElementsService } from './elements.service';
import { Folders } from './folders.entity';
import { Cards } from './cards.entity';
import { Fields } from './fields.entity';
import { FieldsValues } from './fieldsValues.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Folders, Cards, Fields, FieldsValues])],
  controllers: [ElementsController],
  providers: [ElementsService]
})
export class ElementsModule {}
