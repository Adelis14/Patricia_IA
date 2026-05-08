import { Component, OnInit, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { ServicesDeepseekService } from 'src/app/services/services-deepseek.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-user-deepseek',
  templateUrl: './user-deepseek.component.html',
  styleUrls: ['./user-deepseek.component.css']
})
export class UserDeepseekComponent implements OnInit, AfterViewChecked {


  mensajes: {contenido: string | SafeHtml, enviado: 'user' | 'bot', hora: string}[] = [];
  nuevoMensajeUsuario:any;
  cargandoMensajeBot:boolean = false;
  botonEnviarDisabled:boolean = false;

  sugerencias: string[] = [
    "📅 ¿Cuándo son las inscripciones?",
    "🎓 ¿Cuáles son los requisitos de grado?",
    "🏫 ¿Qué carreras ofrecen en la sede Caracas?",
    "💵 Información sobre pagos y aranceles"
  ];

  enviarSugerencia(texto: string) {
    this.nuevoMensajeUsuario = texto;
    this.setPromptUser();
  }

  limpiarConversacion() {
    this.mensajes = [];
  }

  constructor(
    private _deepseekService: ServicesDeepseekService,
    private sanitizer: DomSanitizer
  ){

  }

  ngOnInit(): void {
  }

  @ViewChild('chatContainer') private chatContainer!: ElementRef; // Para el scroll automático
// Para el scroll automático
  ngAfterViewChecked() {
    this.scrollToBottom();
  }


  playSound(): void {
    const audio = new Audio();
    audio.src = '../../../assets/audio/livechat-129007.mp3';
    audio.load();
    audio.play();
  }

  async setPromptUser(){



      debugger;

      if(this.nuevoMensajeUsuario.trim() == ''){
        return;
      }


      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); //Obtener hora actual
      this.mensajes.push({
        contenido: this.nuevoMensajeUsuario,
        enviado: 'user',
        hora: currentTime
      })


      const prompt = this.nuevoMensajeUsuario;
      this.nuevoMensajeUsuario = '';


      try {

        this.botonEnviarDisabled = true;
        this.cargandoMensajeBot = true;
        let result = await this._deepseekService.setPrompt(prompt)
        this.mensajeBotRespuesta(result?.result);
        this.cargandoMensajeBot = false;
        this.botonEnviarDisabled = false;

      } catch (error) {

      }

}


  mensajeBotRespuesta(resultadoPrompt:any){
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); //Obtener hora actual
    this.mensajes.push({
      contenido: this.sanitizer.bypassSecurityTrustHtml(resultadoPrompt?.response as string),
      enviado: 'bot',
      hora: currentTime
    })
    this.playSound();
  }

  // Función para hacer scroll al final del chat
  private scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }


}
