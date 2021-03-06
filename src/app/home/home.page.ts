import { CartService } from './../services/cart.service';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { ModalController, AlertController, PopoverController } from '@ionic/angular';
import { CartModalPage } from '../cart-modal/cart-modal.page';
import { BehaviorSubject } from 'rxjs';
import { PopOverComponent } from '../components/pop-over/pop-over.component';
import { DataService } from '../services/data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {
  cart = [];
  products = [];
  cartItemCount: BehaviorSubject<number>;
  cartIsEmpty: boolean;
  subscription: Subscription;
  typeShopping:any;

  @ViewChild('cart', {static: false, read: ElementRef})fab: ElementRef;

  constructor(private cartService: CartService,
              private modalCtrl: ModalController,
              private alertDialog: AlertController,
              public popoverController: PopoverController,
              private receivedType:DataService) {}

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnInit() {
    this.subscription = this.receivedType.currentMessage.subscribe(d =>{
         this.typeShopping = d;
         this.products = this.cartService.getProducts(this.typeShopping);        
    })
         this.cart = this.cartService.getCart();
         this.cart.length == 0 ? this.cartIsEmpty = true : this.cartIsEmpty = false;         
         this.cartItemCount = this.cartService.getCartItemCount();
    
  }

  addToCart(product) {
    this.cartService.addProduct(product);
    this.animateCSS('tada');
    this.cartIsEmpty = false;
  }

  async openCart() {
    this.animateCSS('bounceOutLeft', true);

    const modal = await this.modalCtrl.create({
      component: CartModalPage,
      cssClass: 'cart-modal'
    });
    modal.onWillDismiss().then(() => {
      this.fab.nativeElement.classList.remove('animated', 'bounceOutLeft');
      this.animateCSS('bounceInLeft');
    });
    modal.present();
  }

  async openEmptyCartAlert() {
    const alert = await this.alertDialog.create({
      mode: 'ios',
      message: 'Please add items to cart',
      buttons: ['OK']
    });
    await alert.present();
  }

  animateCSS(animationName, keepAnimated = false) {
    const node = this.fab.nativeElement;
    node.classList.add('animated', animationName);

    // https://github.com/daneden/animate.css
    function handleAnimationEnd() {
      if (!keepAnimated) {
        node.classList.remove('animated', animationName);
      }
      node.removeEventListener('animationend', handleAnimationEnd);
    }
    node.addEventListener('animationend', handleAnimationEnd);
  }

  async presentPopover() {
    const popover = await this.popoverController.create({
      component: PopOverComponent,
      translucent: true,
    });
    return await popover.present();
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
