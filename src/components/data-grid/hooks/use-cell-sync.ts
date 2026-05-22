import * as React from "react";

/** Sync local state when an external value changes. */
export function useSyncedState<T>(
	value: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
	const [state, setState] = React.useState(value);

	React.useEffect(() => {
		setState(value);
	}, [value]);

	return [state, setState];
}

/** Negative container height for popover `sideOffset`. */
export function useContainerSideOffset(
	ref: React.RefObject<HTMLElement | null>,
): number {
	const [offset, setOffset] = React.useState(0);

	React.useLayoutEffect(() => {
		setOffset(-(ref.current?.clientHeight ?? 0));
	});

	return offset;
}
