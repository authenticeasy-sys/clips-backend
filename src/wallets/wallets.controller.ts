import {
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Body,
  Post,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WalletsService, DisconnectResult } from './wallets.service';
import { ConnectWalletDto } from './dto/connect-wallet.dto';
import { WalletOwnershipGuard } from './guards/wallet-ownership.guard';

interface AuthRequest extends Request {
  user: { userId: number; email: string | null };
}

@Controller('wallets')
@UseGuards(JwtAuthGuard)
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  /**
   * DELETE /wallets/:id
   *
   * Soft-deletes the wallet (sets deletedAt).
   * Blocked if pending payouts exist on the wallet.
   * Returns 404 for wallets that don't exist or belong to another user.
   */
  @Delete(':id')
  @UseGuards(WalletOwnershipGuard)
  @HttpCode(HttpStatus.OK)
  async disconnect(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ): Promise<DisconnectResult> {
    return this.walletsService.disconnect(id, req.user.userId);
  }

  /**
   * POST /wallets/connect
   *
   * Connect or update a wallet for the authenticated user.
   */
  @Post('connect')
  @HttpCode(HttpStatus.OK)
  async connect(@Req() req: AuthRequest, @Body() dto: ConnectWalletDto) {
    return this.walletsService.connect(req.user.userId, dto);
  }
}
