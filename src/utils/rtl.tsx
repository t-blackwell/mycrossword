import { render, RenderOptions } from '@testing-library/react';
import React, { FC, ReactElement } from 'react';
import { Provider } from 'react-redux';
import { store } from '../redux/store';

const AllTheProviders: FC = ({ children }) => (
  <Provider store={store}>{children}</Provider>
);

// create custom render with wrapper that includes redux provider
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
export { store };
