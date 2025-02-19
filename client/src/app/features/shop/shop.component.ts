import { Component, inject } from '@angular/core';
import { ShopService } from '../../core/shop.service';
import { Product } from '../../shared/models/product';
import { ProductItemComponent } from "./product-item/product-item.component";
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from "@angular/material/dialog";
import { FilterDialogComponent } from './filter-dialog/filter-dialog.component';
import { MatMenu, MatMenuTrigger } from "@angular/material/menu";
import { MatListOption, MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import { ShopParams } from '../../shared/models/shopParams';
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { Pagination } from '../../shared/models/pagination';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [
    ProductItemComponent,
    MatButton,
    MatIcon,
    MatMenu,
    MatMenuTrigger,
    MatSelectionList,
    MatListOption,
    MatPaginator,
    FormsModule
  ],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent {
  private shopService = inject(ShopService);
  private dialogService = inject(MatDialog)

  products?: Pagination<Product>;

  selectedSort: string = 'name';
  sortOptions = [
    { name: 'Alphabetical', value: 'name' },
    { name: 'Price: Low - High', value: 'priceAsc' },
    { name: 'Price: High - Low', value: 'priceDesc' }
  ];

  shopParams = new ShopParams();

  pageOptions = [5,10,15,20];

  ngOnInit(): void {
    this.initializeShop();
  }

  initializeShop() {
    this.shopService.getBrands();
    this.shopService.getTypes();
    this.getProducts();
  }

  getProducts() {
    this.shopService.getProducts(this.shopParams).subscribe({
      next: response => this.products = response,
      error: error => console.log(error),
    })
  }

  openFiltersDialog() {
    const dialogRef = this.dialogService.open(FilterDialogComponent, {
      minWidth: '500px',
      data: {
        selectedBrands: this.shopParams.brands,
        selectedTypes: this.shopParams.types
      }
    });

    dialogRef.afterClosed().subscribe({
      next: result => {
        if (result) {
          this.shopParams.brands = result.selectedBrands;
          this.shopParams.types = result.selectedTypes
          this.shopParams.pageNumber = 1; // should be set to page 1 as filter/sort will always apply to all the items not just on the current page number
          this.getProducts();

        }
      }
    })
  }

  onSortChange(event: MatSelectionListChange) {
    const selectedOption = event.options[0];
    if (selectedOption) {
      this.shopParams.sort = selectedOption.value;
      this.shopParams.pageNumber = 1; // should be set to page 1 as filter/sort will always apply to all the items not just on the current page number
      this.getProducts();
      
    }
  }

  onSearchChange() {
    this.shopParams.pageNumber = 1;
    this.getProducts(); 
  }

  handlePageEvent(event: PageEvent) {
    this.shopParams.pageSize = event.pageSize;
    this.shopParams.pageNumber = event.pageIndex + 1;
    this.getProducts();
  }

}
