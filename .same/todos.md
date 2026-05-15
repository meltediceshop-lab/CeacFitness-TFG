# FitMente - Lista de Tareas

## Completado ✅

### Onboarding
- [x] Pantalla de bienvenida con animación
- [x] Selección de nivel (principiante/avanzado)
- [x] Flujo de onboarding para principiantes (7-8 pasos)
- [x] Indicador visual de semana actual vs próxima
- [x] Confirmación final antes de crear el plan
- [x] Vista de calendario con días seleccionados
- [x] Guardar preferencia de inicio de semana
- [x] Selección individual de horario por día (mañana/tarde/noche)
- [x] Lógica de fin de semana (empezar esta semana o la próxima)
- [x] Rango de edad en perfil de setup

### Dashboard
- [x] Vista principal con estadísticas
- [x] Preview de entrenamiento semanal
- [x] Navegación entre pantallas
- [x] **Mensajes de apoyo ("Lo que importa es aparecer")**
- [x] **Sesión cards con descripciones ("Para empezar sin sobrecargar")**
- [x] **Progreso semanal con mensajes dinámicos**

### Perfil (NUEVO)
- [x] Pantalla dedicada de perfil
- [x] Sección de peso actual con actualización
- [x] Sección de progreso (sesiones completadas, semanas activas)
- [x] Medidas corporales (opcional, progressive disclosure)
- [x] Ajustes (días de entrenamiento, duración)
- [x] Botón de reset movido aquí

### Entrenamiento
- [x] Vista de sesión con ejercicios
- [x] Registro de peso y repeticiones
- [x] Timer de descanso
- [x] Modo guiado (paso a paso)
- [x] Modo simple (lista de ejercicios)
- [x] Selección de modo antes de empezar
- [x] **Energy check antes del entrenamiento**
- [x] **4 niveles de energía (muy baja, baja, normal, alta)**
- [x] **Explicaciones para primeras 3 sesiones**

### Session Preview
- [x] Info de sesión (duración, ejercicios)
- [x] Lista de ejercicios con último peso
- [x] Modal de selección de modo
- [x] Opciones de mover/eliminar sesión

### Detalles de ejercicio
- [x] GIF de demostración
- [x] Series, reps, descanso
- [x] Variaciones (barra, mancuernas, máquina, cable)
- [x] Alternativas ("¿No encuentras este ejercicio?")
- [x] Último peso usado

### Historial
- [x] Lista de sesiones completadas
- [x] Comparaciones gentiles de progreso
- [x] Progreso por ejercicio

### Chat controlado
- [x] 7 acciones predefinidas
- [x] Respuestas adaptativas del AI

### Navegación
- [x] **Barra inferior con 3 tabs: Inicio, Historial, Perfil**
- [x] Consistente en todas las pantallas

## Pendiente 🔄

### Mejoras de UX
- [ ] Animaciones de transición entre pantallas más fluidas
- [ ] Notificaciones y recordatorios (requiere backend)
- [ ] Modo oscuro

### Nutrición (NUEVO)
- [x] Pantalla de Nutrición accesible desde Perfil
- [x] Seguimiento de hidratación (8 vasos por día)
- [x] Registro de comidas del día (4 comidas)
- [x] Consejos personalizados según objetivo del usuario
- [x] Persistencia de datos por día

### Funcionalidades
- [ ] Integración con API de AI real (OpenAI/Claude)
- [ ] Más rutinas de ejercicios
- [ ] GIFs/videos demostrativos de ejercicios (algunos ya incluidos)
- [ ] Convertir a PWA para instalación móvil

### Backend
- [ ] Persistencia de datos en servidor
- [ ] Autenticación de usuarios
- [ ] Sincronización entre dispositivos

## Notas
- App funcionando con localStorage para persistencia local
- Framework: Next.js 13 + Tailwind + shadcn/ui
- Animaciones: Framer Motion
- Filosofía: "Entrena tu cuerpo. Cuida tu cabeza."
- Tono: Simple, humano, flexible, de apoyo
