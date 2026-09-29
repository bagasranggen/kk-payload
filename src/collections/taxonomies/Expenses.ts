import { CollectionConfig, FieldHook, Option } from 'payload';

import { CASH_FLOW_DISPLAY_FORMAT } from '@/libs/constansts';
import { ArrayStringProps, ParametersProps } from '@/libs/types';
import { convertIntToCurrency, joinArrayString } from '@/libs/utils';
import { getUpdateCashFlow } from '@/libs/factory';

import { BaseEntry } from '@/shared';

export const EXPENSE_TYPE_OPTIONS: Exclude<Option, string>[] = [
    {
        value: 'crew',
        label: 'Crew',
    },
    {
        value: 'etc',
        label: 'Etc',
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

export type GetExpenseTitleProps = {
    isSlug?: boolean;
    data: ParametersProps<FieldHook>;
};

const getExpenseTitle = async ({
    isSlug,
    data: {
        siblingData,
        req: { payload },
    },
}: GetExpenseTitleProps) => {
    let data: ArrayStringProps = [];

    const expenseType = EXPENSE_TYPE_OPTIONS.find((item) => item?.value === siblingData?.expenseType);

    if (expenseType && expenseType?.label) data.push(expenseType.label as string);

    if (siblingData?.expenseType === 'crew') {
        try {
            const crew = await payload.findByID({
                collection: 'people',
                id: siblingData?.crew,
            });

            if (crew?.title) data.push(crew?.title as string);
        } catch (e) {}
    }

    if (siblingData?.expenseType === 'etc') {
        if (siblingData?.customExpense) data.push(siblingData?.customExpense);
    }

    if (isSlug && siblingData?.date) {
        const formatter = new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });

        data.push(formatter.format(new Date(siblingData.date)));
    }

    return joinArrayString(data, ' - ');
};

export const Expenses: CollectionConfig = {
    slug: 'expenses',
    admin: {
        group: 'Cash Flow',
        useAsTitle: 'title',
        defaultColumns: ['title', 'entryStatus', 'expenseType', 'event', 'expenseCurrency'],
    },
    hooks: {
        afterChange: [
            async ({ data, req }) => {
                await getUpdateCashFlow({ type: 'expense', data, req });
            },
        ],
    },
    fields: BaseEntry({
        typeHandle: [{ value: 'sectionExpense', label: 'Expense' }],
        url: { enabled: false },
        general: {
            title: {
                admin: { readOnly: true },
                hooks: {
                    beforeChange: [async (data) => await getExpenseTitle({ data })],
                },
            },
        },
        sidebar: {
            slug: {
                admin: { readOnly: true },
                beforeChange: async (data) => await getExpenseTitle({ isSlug: true, data }),
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
                                    date: {
                                        displayFormat: CASH_FLOW_DISPLAY_FORMAT,
                                    },
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
                        type: 'row',
                        fields: [
                            {
                                type: 'number',
                                name: 'expense',
                                admin: {
                                    width: '50%',
                                },
                            },
                            {
                                type: 'text',
                                name: 'expenseCurrency',
                                label: 'Expense',
                                admin: {
                                    readOnly: true,
                                    width: '50%',
                                },
                                hooks: {
                                    beforeChange: [
                                        ({ siblingData }) => {
                                            return convertIntToCurrency(siblingData?.expense);
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                ],
            },
        ],
    }),
};
