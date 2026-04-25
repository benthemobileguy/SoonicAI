import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class CreateCheckoutDto {
  @IsNotEmpty({ message: 'Package ID is required' })
  @IsString({ message: 'Package ID must be a string' })
  @IsIn(['starter', 'standard', 'pro'], {
    message: 'Package ID must be one of: starter, standard, pro',
  })
  packageId: string;
}
