import { FieldHook } from 'payload';

import { ArrayStringProps, ParametersProps } from '@/libs/types';
import { joinArrayString } from '@/libs/utils/joinArrayString';

import { EXPENSE_TYPE_OPTIONS } from '@/collections/taxonomies';

export type GetExpenseTitleProps = {
    isSlug?: boolean;
    data: ParametersProps<FieldHook>;
};

export const getExpenseTitle = async ({
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
