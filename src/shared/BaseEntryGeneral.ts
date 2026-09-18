import { Field, Tab, TextField } from 'payload';

import { getUrlPath, GetUrlPathProps } from '@/libs/utils';

export type BaseEntryGeneralProps = {
    enabled?: boolean;
    fields?: Field[];
    title?: Pick<TextField, 'admin' | 'hooks'>;
} & Pick<GetUrlPathProps, 'additionalPath' | 'withSlug'>;

export const BaseEntryGeneral = ({
    enabled = true,
    fields: fieldsProps,
    title = {},
    additionalPath,
    withSlug,
}: BaseEntryGeneralProps): Tab => {
    const fields: Field[] = [];

    fields.push({
        type: 'text',
        name: 'title',
        required: true,
        ...title,
    });

    if (enabled) {
        fields.push({
            type: 'row',
            fields: [
                {
                    type: 'text',
                    name: 'url',
                    label: 'URL',
                    admin: {
                        readOnly: true,
                        width: '50%',
                    },
                    hooks: {
                        beforeChange: [
                            async ({ siblingData, req }) => {
                                const url = await getUrlPath({
                                    siblingData,
                                    req,
                                    additionalPath,
                                    withBaseUri: true,
                                    withSlug,
                                });

                                if (url) return url;
                            },
                        ],
                    },
                },
                {
                    type: 'text',
                    name: 'uri',
                    label: 'URI',
                    admin: {
                        readOnly: true,
                        width: '50%',
                    },
                    hooks: {
                        beforeChange: [
                            async ({ siblingData, req }) => {
                                const url = await getUrlPath({ siblingData, req, additionalPath, withSlug });

                                if (url) return url;
                            },
                        ],
                    },
                },
            ],
        });
    }

    if (fieldsProps) fields.push(...fieldsProps);

    return {
        label: 'General',
        fields,
    };
};
