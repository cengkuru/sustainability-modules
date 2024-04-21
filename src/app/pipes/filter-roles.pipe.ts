import { Pipe, PipeTransform } from '@angular/core';

interface Party {
  // Include all properties that a party object should have
  name: string;
  roles: string[];
  // Add other properties as necessary
}

@Pipe({
  name: 'filterRoles'
})
export class FilterRolesPipe implements PipeTransform {

  transform(parties: Party[], role: string): Party[] {
    if (!parties) {
      return [];
    }
    if (!role) {
      return parties;
    }
    return parties.filter(party => party.roles && party.roles.includes(role));
  }

}
