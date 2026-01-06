/**
 * Participant identifiers for 2-of-2 TEdDSA threshold scheme.
 *
 * In FROST 2-of-2 with IdentifierList::Default:
 * - P0 (Client) = identifier 1
 * - P1 (Server) = identifier 2
 */
export enum Participant {
  /** Client participant (keygen_1, identifier = 1) */
  P0 = 0,
  /** Server participant (keygen_2, identifier = 2) */
  P1 = 1,
}

/**
 * Convert Participant enum to 32-byte FROST identifier.
 *
 * FROST identifiers are 32-byte scalars where:
 * - P0 (Client): [1, 0, 0, ..., 0] (identifier 1)
 * - P1 (Server): [2, 0, 0, ..., 0] (identifier 2)
 */
export function participantToIdentifier(participant: Participant): number[] {
  const identifier = new Array(32).fill(0);
  identifier[0] = participant === Participant.P0 ? 1 : 2;
  return identifier;
}
