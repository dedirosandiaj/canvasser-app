/**
 * Class Name Utility
 * Combines class names conditionally, similar to clsx
 */

type ClassValue = string | boolean | number | undefined | null | ClassValue[];

/**
 * Combines multiple class values into a single string
 * Filters out falsy values and flattens arrays
 * 
 * @example
 * cn('base-class', isActive && 'active', isDisabled && 'disabled')
 * // Returns: 'base-class active' (if isActive is true and isDisabled is false)
 */
export function cn(...classes: ClassValue[]): string {
    return classes
        .flat()
        .filter((x): x is string => typeof x === 'string' && x.length > 0)
        .join(' ');
}

/**
 * Creates a variant class mapper
 * Useful for component variants
 * 
 * @example
 * const buttonVariants = createVariants({
 *   primary: 'bg-blue-500 text-white',
 *   secondary: 'bg-gray-200 text-gray-800',
 * });
 * buttonVariants('primary') // Returns: 'bg-blue-500 text-white'
 */
export function createVariants<T extends Record<string, string>>(
    variants: T
): (variant: keyof T) => string {
    return (variant) => variants[variant];
}
