import type { Folder } from './types';

/** Carpeta de ejemplo con una tarjeta que contiene una subtarjeta. */
export function makeContratosFolder(now = Date.now()): Folder {
  const inHours = (h: number) => new Date(now + h * 3600 * 1000).toISOString();
  const daysAgo = (d: number) => new Date(now - d * 86400000).toISOString();

  return {
    id: 'f_contratos',
    name: 'Contratos de trabajo',
    description: 'Contratos y documentación laboral del equipo.',
    color: '#d4d4d4',
    code: 'CONT-2026',
    memberIds: ['u_user'],
    createdAt: daysAgo(2),
    cards: [
      {
        id: 'c_contratos_1',
        title: 'Contratos del equipo',
        description: 'Documentación laboral y acuerdos vigentes.',
        dueDate: inHours(24 * 30),
        createdAt: daysAgo(1),
        fields: [
          { id: 'fld_contratos_area', label: 'Área', type: 'TEXT', value: 'Recursos Humanos' },
          { id: 'fld_contratos_resp', label: 'Responsable', type: 'TEXT', value: 'Ada Admin' }
        ],
        attachments: [],
        subcards: [
          {
            id: 'sc_contrato_martin',
            title: 'Contrato de trabajo de Martin',
            description: 'Acuerdo laboral vigente y condiciones del puesto.',
            createdAt: daysAgo(1),
            fields: [
              { id: 'fld_martin_puesto', label: 'Puesto', type: 'TEXT', value: 'Desarrollador de software' },
              { id: 'fld_martin_modalidad', label: 'Modalidad', type: 'TEXT', value: 'Tiempo completo' },
              { id: 'fld_martin_inicio', label: 'Fecha de inicio', type: 'DATE', value: '2026-01-15' },
              { id: 'fld_martin_salario', label: 'Salario', type: 'NUMBER', value: '2500' }
            ],
            attachments: []
          }
        ]
      }
    ]
  };
}
