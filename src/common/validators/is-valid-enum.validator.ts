import { ValidateBy, ValidationOptions } from 'class-validator';

export function IsValidEnum(enumType: object, validationOptions?: ValidationOptions) {
  const enumValues = Object.values(enumType);
  const enumName = enumType.constructor.name || 'Enum';

  return ValidateBy(
    {
      name: 'isValidEnum',
      validator: {
        validate: (value: any) => {
          return enumValues.includes(value);
        },
        defaultMessage: () => {
          const validValues = enumValues.join(', ');
          return `Value must be one of: ${validValues}`;
        },
      },
    },
    validationOptions
  );
}
