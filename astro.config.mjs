// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // ... otras configuraciones
  // Desactiva el toolbar para asegurarte de que no inyecte JS en la compilación.
  devToolbar: {
    enabled: false, 
  },
});
