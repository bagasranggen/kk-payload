import { CollectionConfig } from 'payload';
import { BaseEntry } from '@/shared';

export const Expenses: CollectionConfig = {
    slug: 'expenses',
    admin: {
        group: 'Cash Flow',
        useAsTitle: 'title',
    },
    fields: BaseEntry({
        typeHandle: [{ value: 'sectionExpense', label: 'Expense' }],
        url: {
            enabled: false,
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
                        options: [
                            {
                                value: 'crew',
                                label: 'Crew',
                            },
                            {
                                value: 'etc',
                                label: 'Et Cetera',
                            },
                        ],
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
                                options: [
                                    {
                                        value: 'soundEngineer',
                                        label: 'Sound Engineer',
                                    },
                                    {
                                        value: 'documentation',
                                        label: 'Documentation',
                                    },
                                ],
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
