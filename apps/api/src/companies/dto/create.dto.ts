import { IsNotEmpty, IsString, IsUrl } from "class-validator";
import { RegisterDTO } from "../../auth/dto/register.dto";

export class CreateCompany {
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsUrl()
  logo: string;
  categories: string[];
  @IsNotEmpty()
  id_plan: number;
}

export class registerCompanyDTO {
  company: CreateCompany;
  user: RegisterDTO;
}
