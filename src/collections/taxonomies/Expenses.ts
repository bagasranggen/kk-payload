import { CollectionConfig, Option } from 'payload';

import { ArrayStringProps } from '@/libs/types';
import { joinArrayString } from '@/libs/utils';

import { BaseEntry } from '@/shared';

export const EXPENSE_TYPE_OPTIONS: Exclude<Option, string>[] = [
    {
        value: 'crew',
        label: 'Crew',
    },
    {
        value: 'etc',
        label: 'Et Cetera',
    },
];

export const CREW_ROLES_OPTIONS: Exclude<Option, string>[] = [
    {
        value: 'soundEngineer',
        label: 'Sound Engineer',
    },
    {
        value: 'documentation',
        label: 'Documentation',
    },
];

export const Expenses: CollectionConfig = {
    slug: 'expenses',
    admin: {
        group: 'Cash Flow',
        useAsTitle: 'title',
    },
    fields: BaseEntry({
        typeHandle: [{ value: 'sectionExpense', label: 'Expense' }],
        url: { enabled: false },
        general: {
            title: {
                admin: {
                    readOnly: true,
                },
                hooks: {
                    beforeChange: [
                        async ({ siblingData, req: { payload } }) => {
                            let data: ArrayStringProps = [];

                            const expenseType = EXPENSE_TYPE_OPTIONS.find(
                                (item) => item?.value === siblingData?.expenseType
                            );

                            if (siblingData?.expenseType === 'crew') {
                                if (expenseType && expenseType?.label) data.push(expenseType.label as string);

                                try {
                                    const crew = await payload.findByID({
                                        collection: 'people',
                                        id: siblingData?.crew,
                                    });

                                    if (crew?.title) data.push(crew?.title as string);
                                } catch (e) {}
                            }

                            return joinArrayString(data, ' - ');
                        },
                    ],
                },
            },
        },
        tabs: [
            {
                label: 'Detail',
                fields: [
                    {
                        type: 'row',
                        fields: [
                            {
                                type: 'date',
                                name: 'date',
                                defaultValue: new Date(),
                                admin: {
                                    width: '35%',
                                },
                            },
                        ],
                    },
                    {
                        type: 'select',
                        name: 'expenseType',
                        label: 'Type',
                        options: EXPENSE_TYPE_OPTIONS,
                    },
                    {
                        type: 'relationship',
                        name: 'event',
                        relationTo: 'events',
                        admin: {
                            condition: (data, siblingData) => ['crew', 'etc'].includes(siblingData?.expenseType),
                        },
                    },
                    {
                        type: 'row',
                        fields: [
                            {
                                type: 'relationship',
                                name: 'crew',
                                relationTo: 'people',
                                admin: {
                                    width: '60%',
                                    condition: (data, siblingData) => siblingData?.expenseType === 'crew',
                                },
                            },
                            {
                                type: 'select',
                                name: 'crewRole',
                                admin: {
                                    width: '40%',
                                    condition: (data, siblingData) => siblingData?.expenseType === 'crew',
                                },
                                options: CREW_ROLES_OPTIONS,
                            },
                        ],
                    },
                    {
                        type: 'text',
                        name: 'customExpense',
                        admin: {
                            condition: (data, siblingData) => siblingData?.expenseType === 'etc',
                        },
                    },
                    {
                        type: 'number',
                        name: 'expense',
                    },
                ],
            },
        ],
    }),
};
