import { CollectionConfig } from 'payload';

import { BaseEntry } from '@/shared';

export const Sizes: CollectionConfig = {
    slug: 'sizes',
    admin: {
        group: 'Merchandise',
        useAsTitle: 'title',
    },
    fields: BaseEntry({
        url: { enabled: false },
        tabs: [],
    }),
};
