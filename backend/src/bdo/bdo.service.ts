import {
  BadRequestException,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bdo } from '../database/entities/bdo.entity';

const DUMMY_BDOS: Array<
  Pick<Bdo, 'employeeId' | 'name' | 'email' | 'phone' | 'city'>
> = [
  {
    employeeId: 'F101243',
    name: 'Aarav Mehta',
    email: 'aarav.mehta@portea.example',
    phone: '9876543210',
    city: 'Bangalore',
  },
  {
    employeeId: 'F101244',
    name: 'Ishita Rao',
    email: 'ishita.rao@portea.example',
    phone: '9876543211',
    city: 'Mumbai',
  },
  {
    employeeId: 'F101245',
    name: 'Karan Singh',
    email: 'karan.singh@portea.example',
    phone: '9876543212',
    city: 'Chennai',
  },
  {
    employeeId: 'F101246',
    name: 'Nisha Verma',
    email: 'nisha.verma@portea.example',
    phone: '9876543213',
    city: 'Hyderabad',
  },
  {
    employeeId: 'F101247',
    name: 'Rohit Sharma',
    email: 'rohit.sharma@portea.example',
    phone: '9876543214',
    city: 'Delhi',
  },
];

@Injectable()
export class BdoService implements OnModuleInit {
  constructor(
    @InjectRepository(Bdo)
    private readonly bdoRepository: Repository<Bdo>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    for (const dummyBdo of DUMMY_BDOS) {
      const existing = await this.bdoRepository.findOne({
        where: { employeeId: dummyBdo.employeeId },
      });

      if (existing) {
        continue;
      }

      await this.bdoRepository.save(this.bdoRepository.create(dummyBdo));
    }
  }

  listBdos() {
    return this.bdoRepository.find({
      order: { employeeId: 'ASC' },
    });
  }

  async findByEmployeeId(employeeId: string) {
    const normalized = normalizeEmployeeId(employeeId);
    if (!normalized) {
      return null;
    }

    return this.bdoRepository.findOne({
      where: { employeeId: normalized },
    });
  }

  async validateEmployeeId(employeeId: string) {
    const bdo = await this.findByEmployeeId(employeeId);

    if (!bdo) {
      throw new BadRequestException('Invalid bdo_id');
    }

    return bdo;
  }

  async generateWhatsAppLink(employeeId: string) {
    const bdo = await this.validateEmployeeId(employeeId);
    const agentPhone =
      this.configService.get<string>('WHATSAPP_AGENT_PHONE')?.replace(/\D+/g, '') ??
      '919345884291';

    return {
      bdo: serializeBdo(bdo),
      whatsappLink: `https://wa.me/${agentPhone}?text=${encodeURIComponent(
        bdo.employeeId,
      )}`,
    };
  }
}

function normalizeEmployeeId(value: string) {
  return value.trim().toUpperCase();
}

function serializeBdo(bdo: Bdo) {
  return {
    id: bdo.id,
    employeeId: bdo.employeeId,
    name: bdo.name,
    email: bdo.email,
    phone: bdo.phone,
    city: bdo.city,
    createdAt: bdo.createdAt,
  };
}
