import { Injectable} from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map, take } from 'rxjs/operators';

import { Data, Hero, HeroAndLikes, powers } from './model';

@Injectable({ providedIn: 'root'})
export class DataService {

  private cache = new BehaviorSubject<Data>(createDemoData());

  currentHeroAndLikes$: Observable<HeroAndLikes> = this.cache.pipe(
    // When heroes or likes change ...
    distinctUntilChanged((p, c) => p.heroes === c.heroes && p.likes === c.likes),

    // Select current hero and its likes
    map(data => ({
      hero: data.heroes.find(hero => hero.id === data.currentHeroId),
      likes: data.likes.filter(like => like.heroId === data.currentHeroId)
    }))
  );


  data$ = this.cache.asObservable();
  private dataNow$ = this.data$.pipe(take(1));

  selectedUi$ = this.data$.pipe(
    distinctUntilChanged((p, c) => p.selectedUi === c.selectedUi),
    map(d => d.selectedUi)
  );

  saveHeroAndLikes({ hero, likes = [] }: HeroAndLikes) {
    this.dataNow$.subscribe(d => {
      let heroId = hero.id;
      if (heroId > 0) {
        // Update existing hero
        d.heroes = d.heroes.map(h => h.id === heroId ? hero : h);
        d.likes = d.likes
          .filter(l => l.heroId !== heroId)
          .concat(likes.map(l => l.id > 0 ? l : { ...l, id: idCounter++ }));
      } else {
        // Add a new hero
        heroId = idCounter++;
        hero.id = heroId;
        likes = likes.map(l => ({ ...l, id: idCounter++, heroId }));
        d.currentHeroId = heroId;
        d.heroes = d.heroes.concat(hero);
        d.likes = d.likes.concat(likes);
      }
      this.cache.next(d);
    });
  }

  updateSelectedUi(selectedUi: string) {
    this.dataNow$.subscribe(
      d => this.cache.next({ ...d, selectedUi })
    )
  }

  updateCurrentHeroId(currentHeroId) {
    this.dataNow$.subscribe(
      d => this.cache.next({ ...d, currentHeroId })
    )
  }
}

/** Next available id for a Hero or Like */
let idCounter = 18;

/** return a newly created data for the demo */
function createDemoData(): Data {
  const pow = powers.find(p => p.qualifiers.length > 1);
  const heroId = idCounter++;
  const hero: Hero = {
    id: heroId, 
    name: 'Dr IQ', 
    alterEgo: 'Chuck Overstreet', 
    power: pow.name, 
    powerQualifier: pow.qualifiers[1]
  };

  return  {
    currentHeroId: heroId,
    heroes: [hero],
    likes: [
      {id: idCounter++, heroId, name: 'fruit' },
      {id: idCounter++, heroId, name: 'bread'},
      {id: idCounter++, heroId, name: 'hamburger'},
    ],
    selectedUi: '0'
  };
}
