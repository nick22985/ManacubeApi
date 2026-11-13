import { expectTypeOf, test } from 'vitest';
import type * as schemas from '../src/schemas';

type HasIndexSignature<T> = string extends keyof T ? true : false;

test('response types have no index signature', () => {
	expectTypeOf<HasIndexSignature<schemas.Guild>>().toEqualTypeOf<false>();
	expectTypeOf<HasIndexSignature<schemas.Guild['members'][number]>>().toEqualTypeOf<false>();
	expectTypeOf<HasIndexSignature<schemas.TownyTowns['towns'][number]['mayor'] & {}>>().toEqualTypeOf<false>();
	expectTypeOf<HasIndexSignature<schemas.SvaType>>().toEqualTypeOf<false>();
	expectTypeOf<schemas.SvaType['enchants']>().toEqualTypeOf<Record<string, number>>();
});

test('sva field types', () => {
	expectTypeOf<schemas.PlayerSva['customModelData']>().toEqualTypeOf<number | null>();
	expectTypeOf<schemas.SvaType['leatherColor']>().toEqualTypeOf<schemas.LeatherColor | null>();
});
