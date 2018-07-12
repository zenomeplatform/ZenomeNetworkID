// src/utils/metadata/FrozenProps.ts

/**
 * Adds a propery to the object that:
 *  1. will not be listed when enumerating,
 *  2. cannot be changed or deleted
 *
 * Since the object values are stored by references,
 * itself they can be changed, but not the reference.
 *
 * @param  object        An object to add properties
 * @param  propertyKey   Property key
 * @param  propertyValue Property value
 */

export function defineFrozenProperty(
    object: any,
    propertyKey: PropertyKey,
    propertyValue: any
  ) {

  // Just a convinient shortcut for the Object.defineProperty
  // with preconfigured parameters of the descriptor.

  return Object.defineProperty(object, propertyKey, {
    configurable: false,
    enumerable: false,
    value: propertyValue,
    writable: false
  })

}
