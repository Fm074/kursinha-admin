import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-one-time-sign',
  imports: [],
  templateUrl: './one-time-sign.component.html',
  styleUrl: './one-time-sign.component.scss',
  providers: [CookieService],
})
export class OneTimeSignComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private cookieService: CookieService,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const token = params.get('token');
      if (token) {


      } else {
        console.log('Token não encontrado na URL.');
      }
    });

    //   this.route.queryParamMap.subscribe((params) => {
    //   const token = params.get('token');
    //   if (token) {
    //     console.log('Token encontrado:', token);

    //     // Adiciona o token como um cookie
    //     this.cookieService.set('access_token', token, {
    //       expires: 7, // expira em 7 dias
    //       path: '/', // válido para toda a aplicação
    //       secure: true, // só envia em HTTPS
    //       sameSite: 'Strict', // evita CSRF
    //     });

    //     this.router.navigate(['/my-purchases']);

    //     // Exemplo com opções adicionais (expiração, domínio, seguro)
    //     // this.cookieService.set('token', token, 7, '/', null, true, 'Lax');
    //   } else {
    //     console.log('Token não encontrado na URL.');
    //   }
    // });
  }
}
