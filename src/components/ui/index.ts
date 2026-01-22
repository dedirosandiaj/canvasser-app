// UI Components - Barrel Export
// Berry Vue Design System for PJP Dashboard

// Base Components
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize, type ButtonColor } from './Button';
export { TextField, type TextFieldProps, type ValidationState } from './TextField';
export { StatusBadge, type StatusBadgeProps, type StatusType, type BadgeSize } from './StatusBadge';

// Card Component
export { Card, type CardProps, type CardVariant } from './Card';

// Avatar
export { Avatar, type AvatarProps, type AvatarSize, type AvatarVariant } from './Avatar';

// Icon Button
export { IconButton, type IconButtonProps, type IconButtonSize, type IconButtonVariant, type IconButtonColor } from './IconButton';

// Chip / Tag
export { Chip, type ChipProps, type ChipSize, type ChipVariant, type ChipColor } from './Chip';

// Divider
export { Divider, type DividerProps } from './Divider';

// Alert
export { Alert, type AlertProps, type AlertVariant, type AlertSeverity } from './Alert';

// Progress
export { Progress, type ProgressProps, type ProgressVariant, type ProgressColor } from './Progress';

// Skeleton
export {
    Skeleton,
    SkeletonText,
    SkeletonAvatar,
    SkeletonCard,
    type SkeletonProps,
    type SkeletonVariant
} from './Skeleton';

// Menu / Dropdown
export { Menu, type MenuProps, type MenuItem } from './Menu';

// Tooltip
export { Tooltip, type TooltipProps, type TooltipPlacement } from './Tooltip';

// Overlay Components
export { Modal, type ModalProps, type ModalSize } from './Modal';
export { Drawer, type DrawerProps, type DrawerPosition, type DrawerSize } from './Drawer';

// Data Components
export {
    DataTable,
    type DataTableColumn,
    type DataTableProps,
    type SortState,
    type SortDirection,
    type PaginationState
} from './DataTable';

// Autocomplete Components
export { Autocomplete, type AutocompleteProps, type AutocompleteOption } from './Autocomplete';
export { InstitutionAutocomplete, type InstitutionAutocompleteProps } from './InstitutionAutocomplete';
export * from './EDCAutocomplete';
export { CityAutocomplete, type CityAutocompleteProps } from './CityAutocomplete';
export { MccAutocomplete, type MccAutocompleteProps } from './MccAutocomplete';
export { MerchantAutocomplete, type MerchantAutocompleteProps } from './MerchantAutocomplete';

// Toast & Notification Components
export { Toast, type ToastType } from './Toast';
export { ToastProvider, useToast } from './ToastContext';
export { ConfirmModal } from './ConfirmModal';

// Canvasser-specific Components
export { SalesAutocomplete } from './SalesAutocomplete';
export { PhotoCapture } from './PhotoCapture';
