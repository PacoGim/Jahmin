import { writable, type Writable } from 'svelte/store'

import type { ComponentEventType } from '../../../types/componentEvent.type'

export let artGridEvents: Writable<ComponentEventType[] | any[]> = writable([])
export let tagGroupEvents: Writable<ComponentEventType[] | any[]> = writable([])
