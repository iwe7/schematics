import { Path } from '@angular-devkit/core';

export interface FilterOptions {
  /**
   * The name of the filter.
   */
  name: string;
  /**
   * The path to create the filter.
   */
  path?: string | Path;
}
