# Frontend

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.6.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

src/app/
├── core/                               # Módulo Core con servicios y lógica global
│   ├── auth/                           # Servicio de autenticación (manejo de usuario y permisos)
│   ├── guards/                         # Guardas de rutas (seguridad, roles, etc.)
│   ├── interceptors/                   # Interceptores HTTP para autenticación
│   └── services/                       # Servicios generales
│       └── pdf-generator.service.ts    # Servicio para generación de PDFs
├── modules/                            # Módulos funcionales organizados por característica
│   ├── login/                          # Módulo de autenticación (login de usuarios)
│   │   ├── login.component.ts
│   │   ├── login.service.ts
│   ├── cuenta/                         # Administración del plan de cuentas
│   │   ├── cuenta-list.component.ts
│   │   ├── cuenta-form.component.ts
│   │   ├── cuenta.service.ts
│   ├── asiento-contable/               # Módulo de asientos contables
│   │   ├── asiento-list.component.ts
│   │   ├── asiento-form.component.ts
│   │   ├── asiento-contable.service.ts
│   ├── reportes/                       # Módulo de reportes (libro diario y mayor)
│   │   ├── libro-diario.component.ts
│   │   ├── libro-mayor.component.ts
│   │   ├── reportes.service.ts
│   └── usuario/                        # Módulo de usuarios (administración)
│       ├── usuario-list.component.ts
│       ├── usuario-form.component.ts
│       └── usuario.service.ts
└── app-routing.module.ts               # Definición de rutas
└── app.component.ts                    # Componente raíz
└── app.module.ts                       # Módulo raíz
