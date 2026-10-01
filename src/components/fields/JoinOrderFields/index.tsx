import React from 'react';

import { convertIntToCurrency, sortByLatestDate } from '@/libs/utils';

import type { ClientField, Column, Payload } from 'payload';
import { Income, Merchandise } from '@/payload-types';

import { Link, Table } from '@payloadcms/ui';

export type RowsItemProps = {
    formattedDate: Income['date'];
    qty: Income['incomeQty'];
} & (Pick<Merchandise, 'id' | 'title' | 'priceCurrency'> & Pick<Income, 'date' | 'income' | 'incomeCurrency'>);

export type JoinOrderFieldProps = {
    data: Merchandise;
    payload: Payload;
};

export const JoinOrderFields = async ({ payload, data }: JoinOrderFieldProps) => {
    let rows: RowsItemProps[] = [];

    const variants = await payload.find({
        collection: 'merchandiseVariants',
        where: {
            merchandise: { in: data?.variants?.docs ?? [] },
        },
    });

    if (variants?.docs && variants.docs.length > 0) {
        variants.docs.forEach((item) => {
            const tmp: any[] = [];
            const orders = item?.order?.docs ?? [];

            if (orders.length > 0) {
                orders.forEach((order) => {
                    if (typeof order === 'number') return;

                    let date = undefined;
                    if (order?.date) {
                        const formatter = new Intl.DateTimeFormat('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                        });

                        date = formatter.format(new Date(order.date));
                    }

                    tmp.push({
                        id: order.id,
                        title: order.title,
                        date: order.date,
                        formattedDate: date,
                        qty: order.incomeQty,
                        income: order.income,
                        priceCurrency: item?.priceCurrency,
                        incomeCurrency: order.incomeCurrency,
                    });
                });
            }

            if (tmp.length > 0) rows.push(...tmp);
        });
    }

    rows = sortByLatestDate(rows, 'date');

    const columns: Column[] = [
        {
            accessor: 'date',
            active: true,
            field: { name: 'date', type: 'text' } as ClientField,
            Heading: 'Date',
            renderedCells: rows.map((row) => {
                return (
                    <Link
                        href={`/admin/collections/incomes/${row.id}`}
                        target="_blank">
                        {row.formattedDate}
                    </Link>
                );
            }),
        },
        {
            accessor: 'title',
            active: true,
            field: { name: 'title', type: 'text' } as ClientField,
            Heading: 'Title',
            renderedCells: rows.map((row) => row.title),
        },
        {
            accessor: 'qty',
            active: true,
            field: { name: 'qty', type: 'text' } as ClientField,
            Heading: 'Qty',
            renderedCells: rows.map((row) => row.qty),
        },
        {
            accessor: 'price',
            active: true,
            field: { name: 'price', type: 'text' } as ClientField,
            Heading: 'Price',
            renderedCells: rows.map((row) => row.priceCurrency),
        },
        {
            accessor: 'income',
            active: true,
            field: { name: 'income', type: 'text' } as ClientField,
            Heading: 'Income',
            renderedCells: rows.map((row) => row.incomeCurrency),
        },
    ];

    const totalIncome = rows.reduce((total, item) => total + (item?.income ?? 0), 0);

    return (
        <>
            <div style={{ marginBottom: '1.53846rem', textAlign: 'right' }}>
                <p>Total Income: {convertIntToCurrency(totalIncome, true)}</p>
            </div>

            <Table
                columns={columns}
                data={rows}
            />
        </>
    );
};

export default JoinOrderFields;
