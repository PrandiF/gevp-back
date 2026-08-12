# gevp-back

# 🔧 Mantenimiento de usuarios

El proyecto utiliza dos variables de entorno para ejecutar tareas de mantenimiento sobre los usuarios de la base de datos.

Estas tareas **solo deben ejecutarse cuando sea necesario** y luego volver a deshabilitarse.

---

## 🌱 RUN_SEED_USERS

Permite crear o actualizar los usuarios definidos en `utils/UsersSeed.ts`.

### ¿Qué hace?

Por cada usuario del array:

- Si no existe → lo crea.
- Si existe → actualiza:
  - username
  - password
  - salt
  - role
  - deporte

No genera usuarios duplicados.

### Casos de uso

- Cambiar una contraseña.
- Crear un nuevo entrenador.
- Modificar el rol de un usuario.
- Cambiar el deporte asociado.

---

### Flujo de uso

1. Modificar el archivo:

```
Back/src/utils/UsersSeed.ts
```

Ejemplo:

```ts
{
  username: "basquet gevp",
  password: "NuevaPassword123",
  role: "entrenador",
  deporte: "Básquet",
}
```

2. Realizar el push y merge a `main`.

3. En Render cambiar la variable:

```env
RUN_SEED_USERS=true
```

4. Hacer un deploy o reiniciar el servicio.

5. El servidor ejecutará automáticamente:

```ts
await seedDefaultUsers();
```

6. Verificar en los logs:

```
🌱 Running user seed...
🔄 Updated: basquet gevp
```

7. Volver a dejar:

```env
RUN_SEED_USERS=false
```

---

## 🔄 RUN_UPDATE_USERNAMES

Permite renombrar usuarios existentes sin crear registros nuevos.

Se utiliza principalmente para migraciones de nombres.

Ejemplo:

```ts
const usernameChanges = [
  {
    old: "basquet gevp",
    new: "basquet profesional",
  },
];
```

---

### Flujo de uso

1. Modificar `usernameChanges`.

2. Push + Merge a `main`.

3. En Render:

```env
RUN_UPDATE_USERNAMES=true
```

4. Deploy o restart.

5. Verificar en logs:

```
🔄 Running username updates...
🔄 Username updated: basquet gevp → basquet profesional
```

6. Volver la variable a:

```env
RUN_UPDATE_USERNAMES=false
```

---

# ⚠️ Importante

Las variables deben permanecer normalmente en:

```env
RUN_SEED_USERS=false
RUN_UPDATE_USERNAMES=false
```

Solo deben colocarse en `true` durante el deploy o reinicio en el que se desea ejecutar la tarea correspondiente.

De esta forma se evita que el seed o las migraciones se ejecuten cada vez que el servidor reinicia.

---

# 📋 Resumen

| Acción             | Modificar código | Variable                    | Deploy/Restart | Volver a `false` |
| ------------------ | ---------------- | --------------------------- | -------------- | ---------------- |
| Cambiar contraseña | ✅               | `RUN_SEED_USERS=true`       | ✅             | ✅               |
| Crear entrenador   | ✅               | `RUN_SEED_USERS=true`       | ✅             | ✅               |
| Cambiar deporte    | ✅               | `RUN_SEED_USERS=true`       | ✅             | ✅               |
| Cambiar rol        | ✅               | `RUN_SEED_USERS=true`       | ✅             | ✅               |
| Renombrar username | ✅               | `RUN_UPDATE_USERNAMES=true` | ✅             | ✅               |
