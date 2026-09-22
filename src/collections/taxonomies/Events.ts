import { CollectionConfig } from 'payload';
import { BaseEntry } from '@/shared';

export const Events: CollectionConfig = {
    slug: 'events',
    admin: {
        // group: 'Taxonomies',
        useAsTitle: 'eventTitle',
    },
    fields: BaseEntry({
        typeHandle: [{ value: 'sectionEvent', label: 'Event' }],
        url: { enabled: false },
        sidebar: {
            fields: [
                {
                    type: 'text',
                    name: 'eventTitle',
                    admin: {
                        hidden: true,
                        readOnly: true,
                    },
                    hooks: {
                        beforeChange: [
                            ({ siblingData }) => {
                                let data = '';

                                if (siblingData?.title) data = siblingData.title;
                                if (siblingData?.date) {
                                    const formatter = new Intl.DateTimeFormat('en-GB', {
                                        dateStyle: 'medium',
                                    });

                                    data += ` - ${formatter.format(new Date(siblingData.date))}`;
                                }

                                return data;
                            },
                        ],
                    },
                },
                {
                    type: 'select',
                    name: 'eventConfirmation',
                    defaultValue: 'confirmed',
                    required: true,
                    options: [
                        {
                            value: 'tbc',
                            label: 'To Be Confirmed',
                        },
                        {
                            value: 'confirmed',
                            label: 'Confirmed',
                        },
                    ],
                },
                {
                    type: 'select',
                    name: 'eventType',
                    options: [
                        {
                            value: 'internal',
                            label: 'Internal',
                        },
                        {
                            value: 'publicFree',
                            label: 'Public - Free',
                        },
                        {
                            value: 'publicTicketing',
                            label: 'Public - Ticketing',
                        },
                    ],
                },
                {
                    type: 'number',
                    name: 'totalIncome',
                    admin: {
                        readOnly: true,
                    },
                    hooks: {
                        beforeChange: [
                            async ({ siblingData, req: { payload, context } }) => {
                                if (context.triggeringRelatedUpdate) return;

                                let data = 0;

                                try {
                                    const incomes = await payload.find({
                                        collection: 'incomes',
                                        select: { income: true },
                                        where: {
                                            id: { in: siblingData?.incomes?.docs },
                                        },
                                    });

                                    const totalIncome = incomes?.docs.reduce(
                                        (accumulator, currentValue) => accumulator + (currentValue?.income ?? 0),
                                        0
                                    );

                                    if (totalIncome > 0) data = totalIncome;
                                } catch {}

                                return data;
                            },
                        ],
                    },
                },
                {
                    type: 'number',
                    name: 'totalExpense',
                    admin: {
                        readOnly: true,
                    },
                    hooks: {
                        beforeChange: [
                            async ({ siblingData, req: { payload, context } }) => {
                                if (context.triggeringRelatedUpdate) return;

                                let data = 0;

                                try {
                                    const expenses = await payload.find({
                                        collection: 'expenses',
                                        select: { expense: true },
                                        where: {
                                            id: { in: siblingData?.expenses?.docs },
                                        },
                                    });

                                    const totalIncome = expenses?.docs.reduce(
                                        (accumulator, currentValue) => accumulator + (currentValue?.expense ?? 0),
                                        0
                                    );

                                    if (totalIncome > 0) data = totalIncome;
                                } catch {}

                                return data;
                            },
                        ],
                    },
                },
                {
                    type: 'number',
                    name: 'profit',
                    admin: {
                        readOnly: true,
                    },
                    hooks: {
                        beforeChange: [
                            ({ siblingData }) => {
                                let data = 0;

                                if (siblingData?.totalIncome && siblingData?.totalExpense) {
                                    data = siblingData.totalIncome - siblingData.totalExpense;
                                }

                                return data;
                            },
                        ],
                    },
                },
            ],
            slug: {
                beforeChange: ({ siblingData }) => {
                    let data = '';

                    let date = siblingData?.date ?? '';
                    let time = siblingData?.time ?? '';

                    if (date) {
                        const formatter = new Intl.DateTimeFormat('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                        });

                        data = formatter.format(new Date(date));
                    }

                    if (time) {
                        const formatter = new Intl.DateTimeFormat('en-GB', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false, // Use 24-hour clock
                        });

                        data += formatter.format(new Date(time)).replace(/:/g, '');
                    }

                    return data;
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
                                label: 'Event Date',
                                admin: {
                                    width: '25%',
                                    date: {
                                        pickerAppearance: 'dayOnly',
                                    },
                                },
                            },
                            {
                                type: 'date',
                                name: 'time',
                                label: 'Event Time',
                                admin: {
                                    width: '25%',
                                    date: {
                                        pickerAppearance: 'timeOnly',
                                    },
                                },
                            },
                        ],
                    },
                ],
            },
            {
                label: 'Incomes',
                fields: [
                    {
                        type: 'join',
                        name: 'incomes',
                        label: false,
                        collection: 'incomes',
                        on: 'event',
                        admin: {
                            defaultColumns: ['incomeType', 'title', 'income'],
                        },
                    },
                ],
            },
            {
                label: 'Expenses',
                fields: [
                    {
                        type: 'join',
                        name: 'expenses',
                        label: false,
                        collection: 'expenses',
                        on: 'event',
                        admin: {
                            defaultColumns: ['expenseType', 'title', 'expense'],
                        },
                    },
                ],
            },
        ],
    }),
};
