import { FieldHook } from 'payload';

import { ArrayStringProps, ParametersProps } from '@/libs/types';
import { joinArrayString } from '@/libs/utils/joinArrayString';

export type GetIncomeTitleProps = {
    isSlug?: boolean;
    data: ParametersProps<FieldHook>;
};

export const getIncomeTitle = async ({
    isSlug,
    data: {
        siblingData,
        req: { payload },
    },
}: GetIncomeTitleProps) => {
    let data: ArrayStringProps = [];

    if (siblingData?.incomeDetail) data.push(siblingData.incomeDetail);

    if (siblingData?.incomeType === 'event' && siblingData?.event) {
        try {
            const event = await payload.findByID({
                collection: 'events',
                id: siblingData?.event,
            });

            if (event?.eventTitle) data.push(event.eventTitle);
        } catch (e) {}
    }

    if (siblingData?.incomeType === 'merchandise' && siblingData?.merchandise) {
        try {
            const merchandise = await payload.findByID({
                collection: 'merchandiseVariants',
                id: siblingData?.merchandise,
            });

            if (merchandise?.title) data.push(merchandise.title);
        } catch (e) {}
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
