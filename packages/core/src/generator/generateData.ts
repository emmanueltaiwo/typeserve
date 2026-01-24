import { faker } from '@faker-js/faker';
import { ParsedType, TypeProperty } from '../types';

export function generateData(
  parsedType: ParsedType,
  arrayCount?: number,
  parsedTypes?: Map<string, ParsedType>,
): any {
  if (parsedType.isEnum && parsedType.enumValues) {
    const value = faker.helpers.arrayElement(parsedType.enumValues);
    return parsedType.isArray ? [value] : value;
  }

  if (parsedType.isArray) {
    const count =
      arrayCount !== undefined
        ? Math.min(Math.max(1, arrayCount), 5)
        : faker.number.int({ min: 1, max: 3 });
    return Array.from({ length: count }, () =>
      generateObject(parsedType, parsedTypes),
    );
  }

  return generateObject(parsedType, parsedTypes);
}

function isDateField(key: string): boolean {
  const keyLower = key.toLowerCase();
  const datePatterns = [
    'createdat',
    'created_at',
    'created',
    'updatedat',
    'updated_at',
    'updated',
    'deletedat',
    'deleted_at',
    'deleted',
    'publishedat',
    'published_at',
    'published',
    'modifiedat',
    'modified_at',
    'modified',
    'date',
    'timestamp',
    'time',
  ];
  return datePatterns.some((pattern) => keyLower.includes(pattern));
}

function generateObject(
  parsedType: ParsedType,
  parsedTypes?: Map<string, ParsedType>,
): any {
  const result: any = {};

  for (const [key, prop] of Object.entries(parsedType.properties)) {
    if (prop.isOptional && faker.datatype.boolean()) {
      continue;
    }

    if (prop.isArray) {
      result[key] = Array.from(
        { length: faker.number.int({ min: 1, max: 3 }) },
        () => generateValue(prop, key, parsedTypes),
      );
    } else {
      result[key] = generateValue(prop, key, parsedTypes);
    }
  }

  return result;
}

function generateValue(
  prop: TypeProperty,
  key?: string,
  parsedTypes?: Map<string, ParsedType>,
): any {
  if (prop.nestedType) {
    return generateObject(prop.nestedType, parsedTypes);
  }

  if (prop.isEnum && prop.enumValues) {
    return faker.helpers.arrayElement(prop.enumValues);
  }

  const type = prop.type.toLowerCase();
  const typeName = prop.type;
  const keyLower = key?.toLowerCase() || '';

  if (isDateField(keyLower) || typeName === 'date' || type.includes('date')) {
    return faker.date.recent().toISOString();
  }

  if (typeName === 'string' || type.includes('string')) {
    if (keyLower.includes('email')) return faker.internet.email();
    if (keyLower.includes('id') || keyLower.endsWith('id'))
      return faker.string.uuid();
    if (keyLower.includes('url')) return faker.internet.url();
    if (keyLower.includes('name')) return faker.person.fullName();
    if (keyLower.includes('title')) return faker.lorem.sentence();
    if (keyLower.includes('description')) return faker.lorem.paragraph();
    if (keyLower.includes('address')) return faker.location.streetAddress();
    return faker.lorem.word();
  }

  if (typeName === 'number' || type.includes('number')) {
    return faker.number.int({ min: 0, max: 1000 });
  }

  if (typeName === 'boolean' || type.includes('boolean')) {
    return faker.datatype.boolean();
  }

  if (type.includes('[]')) {
    return [];
  }

  return null;
}
