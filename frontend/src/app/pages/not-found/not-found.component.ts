import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-background">
      <div class="text-center animate-fade-in">
        <h1 class="text-6xl font-bold text-primary mb-4">404</h1>
        <p class="text-xl text-muted-foreground mb-6">Page not found</p>
        <a routerLink="/login"
          class="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors inline-block">
          Go to Login
        </a>
      </div>
    </div>
  `
})
export class NotFoundComponent {}
