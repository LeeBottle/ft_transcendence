import { IsEmail, IsNotEmpty, IsString, MinLength, Length, Matches } from 'class-validator';

export class SignupDto {
  @IsEmail({}, { message: '유효한 이메일을 입력해주세요.' })
  @IsNotEmpty({ message: '이메일은 필수 입력 항목입니다.' })
  email!: string;

  @IsString()
  @MinLength(6, { message: '비밀번호는 최소 6자 이상이어야 합니다.' })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: '닉네임은 필수 입력 항목입니다.' })
  @Length(2, 10, { message: '닉네임은 2자 이상 10자 이하이어야 합니다.' })
  @Matches(/^[a-zA-Z0-9가-힣]+$/, { message: '닉네임은 영문, 숫자, 한글만 사용 가능합니다.' })
  nickname!: string;
}
