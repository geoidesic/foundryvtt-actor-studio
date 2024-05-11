export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function localize(string) {
  return game.i18n.localize(`LOCAL.${string}.label`);
}

export function isNumber(value) {
  return typeof value === 'number' && isFinite(value);
}

export function getAllAttributeValues() {
  const allValues = [];

  for (const key in attributes) {
    if (attributes.hasOwnProperty(key)) {
      allValues.push(...attributes[key]);
    }
  }

  return allValues;
}

export const i18n = (s, d = {}) => game.i18n.format(s, d);


export function isAttribute(val) {
  if (Object.keys(attributes).includes(val)) return true;
  return false;
}


export function ucfirst(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function getSubAttributeGroup(subAttribute) {
  for (const key in attributes) {
    if (attributes.hasOwnProperty(key)) {
      if (attributes[key].includes(subAttribute)) {
        return key;
      }
    }
  }
}

export function extractMapIteratorObjectProperties(mapIterator, keys) {
  const newArray = [];
  for (const [key, data] of mapIterator) {
    const newObj = {};
    keys.forEach((k) => {
      if(k.includes('->')){
        const split = k.split('->');
        newObj[split[1]] = data[split[0]];
      } else {
        newObj[k] = data[k];
      }
    });
    newObj.key = key;
    newArray.push(newObj);
  }
  return newArray;
}


export function getActorOwner(actor) {
  const owners = getOwners(actor);
  if (owners.length === 0) {
    return game.user;
  }
  if (owners.length === 1) {
    return owners[0];
  }

  let owner = owners.reduce((owner, currentOwner) => {
    if (!currentOwner.isGM) {
      owner = currentOwner;
    }
    return owner;
  }, null);

  if (!owner) {
    if (game.user.isGM) {
      return game.user;
    }
  }

  if (!owner) {
    return game.user;
  }

  return owner;
}

export async function updateMessage(messageId, data) {
  // check if chat message owner is this user
  const message = game.messages.get(messageId);
  if (message.user.id !== game.user.id) {
    // emit to owner of message
    game.socket.emit(`system.${game.system.id}`, {
      type: "chatMessage",
      mode: "messageUpdate",
      messageId,
      data
    });
  } else {
    console.log('Current user is message owner');
    // update message
    await message.update(data)
  }
}

export function getOwners(actor) {
  return game.users.filter(u => actor.testUserPermission(u, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER))
}

export function getGMs() {
  return game.users.filter(u => u.isGM).map(u => u.id)
}

export function getBookmarkedItems(Actor, limit = false) {
  // if limit is a number, then truncate the array to that number
  if (limit && typeof limit === 'number') {
    return Actor?.items?.filter((i) => i.system.bookmarked).slice(0, limit);
  } else {
    return Actor?.items?.filter((i) => i.system.bookmarked);
  }
};

/**
 * @param {*} actor 
 * @param {*} type 
 * @returns array of items of type
 */
export function getItemsByType(actor, type) {
  if (!actor || !actor.items) return [];
  const item = actor?.items?.filter(i => i.type === type);
  return item;
}
export function decodeUuidString(uuid) {
  return uuid.replace(/_/g, "\.");
}


/**
 * This is necessary because of a wierd context difference between foundry and svelte
 * Foundry's update method interprets dot notation as data nodes and so creates a nested data structure from it if you use it as a key
 * Svelte's stores do not, they use it as a string literal.
 * If you're trying to use actor uuid as a storage key then this conversion becomes necessary
 * @param {string} uuid 
 * @returns {string} replaces dots with underscores
 */
export function encodeUuidString(uuid) {
  return uuid.replace(/\./g, "_");
}

export function findKeysByValue(obj, value) {
  return Object.entries(obj)
    .filter(([key, val]) => val === value)
    .map(([key]) => key);
}

/**
 * Not surewhy we need the origin? Only reason I can think of is for effectsFilterQuery `type` filter – because `type` is only present on the original.
 * @param {object} effect 
 * @returns original item
 */
export function getEffectOrigin(effect) {
  if (!game.actors) return null;
  const origin = effect._source.origin;
  if (!origin) return null;
  const split = origin.split(".");
  let item = void 0;
  if (split.length == 4) {
    item = effect.parent.items.get(split[3]);
  } else {
    try {
      item = game.actors?.get(origin)
        || game.items?.get(origin)
        || game.packs?.get('effects');
    } catch (error) {
      console.warn('getEffectOrigin', effect, origin);
      throw error;
    }
  }
  return item;
}

export async function getCompendiumEffect(effect) {
  if (!effect) {
    console.trace()
    return null;
  }
  console.log('getCompendiumEffect effect', effect);

  const origin = fromUuid(effect._source.origin);
  console.log('getCompendiumEffect origin', origin);
  if (!origin) {
    console.error('Could not find effect origin')
    return null;
  }
  return origin;
}


// truncate string
export function truncate(str, n) {
  return str.length > n ? str.substr(0, n - 1) + "..." : str;
}


export function isParentActor(item) {
  return item?.parent?.constructor?.name === 'SurgeActor';
}
