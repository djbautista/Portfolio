import 'server-only';

import { Component } from '../model/Component';

export type InitialComponents = {
  components: Component[];
};

export default async function getInitialBlocks(): Promise<InitialComponents> {
  const searchParams = new URLSearchParams({
    'fields[0]': 'title',
    'fields[1]': 'slug',
    'populate[components][on][text.block1][populate]': '*',
    'populate[components][on][text.block2][populate][background][fields][0]':
      'url',
    'populate[components][on][text.block2][populate][background][fields][1]':
      'mime',
    'populate[components][on][text.block3][populate]': '*',
    'filters[slug]': 'home',
  });

  const response = await fetch(
    `${process.env.DEMO_COMPONENTS_API_URL}/api/pages?${searchParams}`,
  );

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return await response
    .json()
    .then(({ data }) => (data?.length === 1 ? data[0] : null));
}
