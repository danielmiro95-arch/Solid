# SolidStream como app de Microsoft Teams

Personal tab que embebe SolidStream completo dentro de Teams.

## Archivos

| Archivo | Qué es |
|---|---|
| `manifest.json` | Definición de la app Teams (personal tab → `solid-zeta.vercel.app`) |
| `color.png` | Icono 192×192 (logo BeonIt sobre violeta) |
| `outline.png` | Icono 32×32 monocromo (barra lateral de Teams) |
| `solidstream-teams.zip` | Los 3 anteriores empaquetados · **esto es lo que se sube a Teams** |

## Probar ya (sideload · sin IT)

1. Abre Teams (escritorio o web)
2. Barra lateral izquierda → **Apps** → abajo **Manage your apps** → **Upload an app** → **Upload a custom app**
   - Si no ves esa opción, el tenant tiene el sideload desactivado → necesitas que el IT de Repsol lo habilite o que suba la app por ti (ver abajo)
3. Selecciona `solidstream-teams.zip`
4. **Add** → SolidStream aparece en tu barra lateral como app personal
5. Ábrela: verás toda la plataforma dentro de Teams

## Publicar para toda Repsol (vía IT)

1. El IT de Repsol entra en **Teams Admin Center** → **Teams apps** → **Manage apps** → **Upload new app**
2. Sube `solidstream-teams.zip`
3. Aprueba y asigna una política de permisos (a quién se le muestra)
4. Los empleados la ven en su catálogo de apps de Teams

## Notas técnicas

- El embedding funciona porque `vercel.json` envía `Content-Security-Policy: frame-ancestors` permitiendo `teams.microsoft.com`.
- El `index.html` carga el Teams JS SDK e inicializa solo si detecta que está embebido (`?teams=1` o dentro de iframe). En navegador normal no hace nada.
- El tema (claro/oscuro) se sincroniza con el de Teams automáticamente.
- La autenticación actual es la propia de SolidStream (Supabase, email/password). El login se hace **dentro** del iframe.

## Siguiente nivel · SSO con Microsoft 365 (opcional)

Para que el empleado entre automáticamente con su cuenta Microsoft de Repsol (sin login manual):
1. Registrar la app en Azure AD (Entra ID) del tenant de Repsol
2. Añadir `webApplicationInfo` al manifest con el App ID + scope
3. Conectar el token Azure con Supabase Auth (provider SAML/OIDC) o validar el token en el backend

Esto requiere coordinación con el IT de Repsol (acceso a su Azure AD).

## Actualizar la app

Si cambias el manifest o los iconos, regenera el zip:

```bash
cd teams && zip -j solidstream-teams.zip manifest.json color.png outline.png
```

Y vuelve a subirlo (incrementa `version` en `manifest.json` si Teams lo pide).
