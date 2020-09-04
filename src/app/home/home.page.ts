import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Observable } from 'rxjs';

import {
  AuthenticationService,
  TeaCategoriesService,
  AnalyticsService,
} from '@app/services';
import { TeaCategory } from '@app/models';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  categories$: Observable<Array<TeaCategory>>;

  constructor(
    private authentication: AuthenticationService,
    private navController: NavController,
    private teaCategories: TeaCategoriesService,
    private analytics: AnalyticsService,
  ) {}

  ionViewDidEnter() {
    this.analytics.trackScreen('homePage');
  }

  ngOnInit() {
    this.categories$ = this.teaCategories.getAll();
  }

  logout() {
    this.analytics.logEvent('logout');
    this.authentication.logout();
  }

  editCategory(id: number) {
    this.navController.navigateForward(['edit-tea-category', id]);
  }
}
