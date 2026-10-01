export class CreateUserDto {
  name!: string;
  email!: string;
  password!: string;
}

export class CreateGoogleUserDto {
  googleId!: string;
  email!: string;
  password?: string;
  firstName!: string;
  lastName!: string;
  picture!: string;
  accessToken!: string;
}
