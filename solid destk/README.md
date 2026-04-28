# solid destk/ — Workaround Vercel

Esta carpeta es **una copia funcional del proyecto** (`docs/`, `api/`, `vercel.json`) creada
exclusivamente porque el dashboard de Vercel del proyecto `solid-platform` tenía
configurado `solid destk` como **Root Directory**, y al limpiar la carpeta original
(que era basura duplicada de un upload antiguo) Vercel empezó a fallar con:

```
The specified Root Directory "solid destk" does not exist. Please update your Project Settings.
```

## Cómo eliminar este parche

1. Vete a **vercel.com → Solid-platform → Settings → General → Root Directory**
2. Bórralo (o pon `./`) y guarda
3. En este repo, borra esta carpeta entera: `rm -rf "solid destk"`
4. Ya no te depende de mantener dos copias sincronizadas

## ¿Por qué duplicación y no symlinks?

Los symlinks de git que apunten fuera de la Root Directory (`../docs`) NO los sigue
Vercel: el build sandbox no incluye nada por encima de la Root Directory configurada.
Por eso necesitamos copias literales de los archivos.

## Mantenimiento

Cuando se cambie algo en `/docs/` o `/api/`, hay que duplicarlo aquí. Hasta que se
arregle el dashboard. Lo más rápido:

```bash
rsync -a --delete docs/ "solid destk/docs/"
rsync -a --delete api/ "solid destk/api/"
cp vercel.json "solid destk/vercel.json"
```
