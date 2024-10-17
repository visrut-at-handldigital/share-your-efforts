import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

import { recoverPersonalSignature } from '@metamask/eth-sig-util';
import { bufferToHex } from 'ethereumjs-util';

import * as jwt from 'jsonwebtoken';

const nonces = {};

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/api/auth/metamask-nonce')
  getMetamaskNonce(
    @Body()
    body: {
      walletAddress: string;
    },
  ): { nonce: string } {
    const { walletAddress } = body;

    const nonce = crypto.randomUUID();
    nonces[walletAddress] = nonce;

    return {
      nonce,
    };
  }

  @Post('/api/auth/metamask')
  authenticateMetamask(
    @Body()
    body: {
      walletAddress: string;
      signature: string;
    },
  ): { token: string } {
    const { walletAddress, signature } = body;

    const nonce = nonces[walletAddress];

    if (!nonce) {
      throw new Error('Nonce not found');
    }

    const msgBufferHex = bufferToHex(Buffer.from(nonce, 'utf8'));
    const recoveredAddress = recoverPersonalSignature({
      data: msgBufferHex,
      signature: signature,
    });

    if (recoveredAddress.toLowerCase() === walletAddress.toLowerCase()) {
      const token = jwt.sign({ walletAddress }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      delete nonces[walletAddress];

      return {
        token,
      };
    }

    throw new Error('Invalid signature');
  }
}
