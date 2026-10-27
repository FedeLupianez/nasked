import { IsNotEmpty, IsString } from "class-validator"

export class JoinFolderDTO {
  @IsNotEmpty()
  id_account: string;
  @IsNotEmpty()
  @IsString()
  folder_token: string;
}
