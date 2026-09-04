import { Body, Controller, Get, HttpCode, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service.js";
import { registerSchema, type RegisterDto } from "./dto/register.dto.js";
import { loginSchema, type LoginDto } from "./dto/login.dto.js";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import { Public } from "../../common/decorators/public.decorator.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { toApiBodySchema } from "../../common/swagger/zod-schema.util.js";
import type { AuthenticatedUser } from "./authenticated-user.js";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  @ApiBody({ schema: toApiBodySchema(registerSchema) })
  register(@Body(new ZodValidationPipe(registerSchema)) dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post("login")
  @HttpCode(200)
  @ApiBody({ schema: toApiBodySchema(loginSchema) })
  login(@Body(new ZodValidationPipe(loginSchema)) dto: LoginDto) {
    return this.authService.login(dto);
  }

  @ApiBearerAuth()
  @Get("me")
  me(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }
}
