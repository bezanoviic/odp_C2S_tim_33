import { Request, Response, Router } from 'express';
import { IAuthService } from '../../Domain/services/auth/IAuthService';
import jwt from "jsonwebtoken";

export class AuthController {
  private router: Router;
  private authService: IAuthService;

  constructor(authService: IAuthService) {
    this.router = Router();
    this.authService = authService;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/auth/login', this.prijava.bind(this));
    this.router.post('/auth/register', this.registracija.bind(this));
  }

  /**
   * POST /api/v1/auth/login
   * Prijava korisnika
   */
  private async prijava(req: Request, res: Response): Promise<void> {
    try {
      const { korisnickoIme, lozinka } = req.body;

      // TODO: Validacija input parametara
      // const rezultat = authPrijavaValidator(korisnickoIme, lozinka);

      // if (!rezultat.uspesno) {
      //   res.status(400).json({ success: false, message: rezultat.poruka });
      //   return;
      // }

      const result = await this.authService.prijava(korisnickoIme, lozinka);

      // Proveravamo da li je prijava uspešna
      if (result.id !== 0) {
        // Kreiranje jwt tokena
        const token = jwt.sign(
          { 
            id: result.id, 
            korisnickoIme: result.korisnickoIme, 
            uloga: result.uloga,
          }, process.env.JWT_SECRET ?? "", { expiresIn: '6h' });

        res.status(200).json({success: true, message: 'Uspešna prijava', data: token});
        return;
      } else {
        res.status(401).json({success: false, message: 'Неисправно корисничко име или лозинка'});
        return;
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({success: false, message: error});
    }
  }

  /**
   * POST /api/v1/auth/register
   * Registracija novog korisnika
   */
  private async registracija(req: Request, res: Response): Promise<void> {
    try {
      const { korisnickoIme, lozinka, uloga } = req.body;
      
      // TODO: Validator podataka za registraciju
      // const rezultat = authRegistracijaValidator(korisnickoIme, lozinka);

      // if (!rezultat.uspesno) {
      //   res.status(400).json({ success: false, message: rezultat.poruka });
      //   return;
      // }

      const result = await this.authService.registracija(korisnickoIme, uloga, lozinka);
      
      // Proveravamo da li je registracija uspešna
      if (result.id !== 0) {
        // Kreiranje jwt tokena
        const token = jwt.sign(
          { 
            id: result.id, 
            korisnickoIme: result.korisnickoIme, 
            uloga: result.uloga,
          }, process.env.JWT_SECRET ?? "", { expiresIn: '6h' });


        res.status(201).json({success: true, message: 'Uspešna registracija', data: token});
      } else {
        res.status(401).json({success: false, message: 'Регистрација није успела. Корисничко име већ постоји.', });
      }
    } catch (error) {
      res.status(500).json({success: false, message: error});
    }
  }

  /**
   * Getter za router
   */
  public getRouter(): Router {
    return this.router;
  }
}