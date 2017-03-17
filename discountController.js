var app = angular.module('disCountApp', []);
app.controller('disCountCtrl', function($scope, $http,$rootScope) {
	$http.get("../data/goodslist.json")
		.success(function(response) {
			$scope.commodity = response;
	});
	
	$scope.discountName = [
			{
				id:"1",
				text:"买2送一"
			},
			{
				id:"2",
				text:"95折优惠"
			}];
	
	$scope.discountArr = []
	if(window.localStorage.discountArrList){
		$scope.discountArr = JSON.parse(window.localStorage.discountArrList);
	}
	
	$scope.currentRow = "";//当前行号
	$scope.addBarCode = "";	
	$scope.addName ="";
	$scope.addCategory ="";
	
	
	//添加商品
	$scope.saveGood =function(){
		var selectedCode = "";
		var selectedName = "";
		if($scope.selectedName){
			selectedCode = $scope.selectedName.id;
			selectedName = $scope.selectedName.text;
		}
		var object = {
			barCode :$scope.addBarCode ,
			name : $scope.addName,
			category : $scope.addCategory,
			price : parseInt($scope.addPrice),
			specialOffer : selectedCode,	
			specialOfferName :selectedName
		}
		
		$scope.discountArr.push(object);
		window.localStorage.discountArrList = JSON.stringify($scope.discountArr);
		$('#addDiscount').modal("hide");
	}
	
	//删除商品
	$scope.deleteGood =function(index){
		$scope.discountArr.splice(index,1);
		window.localStorage.discountArrList = JSON.stringify($scope.discountArr);
	}
	
	//打开编辑弹窗
	$scope.openEdit=function(index){
		$('#editDiscount').modal("show");
		var editDis = $scope.discountArr[index];
		$scope.editBarCode = editDis.barCode;
		$scope.editName = editDis.name;
		$scope.editCategory = editDis.category;
		$scope.editPrice = editDis.price;
		$scope.currentRow = index;
	}
	
	//修改商品
	$scope.editGood=function(){
		var editDis = $scope.discountArr[$scope.currentRow];
		editDis.barCode = $scope.editBarCode;
		editDis.name = $scope.editName;
		editDis.category = $scope.editCategory;
		editDis.price = $scope.editPrice;
		if($scope.editDiscountName){
			editDis.specialOffer = $scope.editDiscountName.id;
			editDis.specialOfferName = $scope.editDiscountName.text;
		}else{
			$scope.editDiscountName=null;
		}
		window.localStorage.discountArrList = JSON.stringify($scope.discountArr);
		$('#editDiscount').modal("hide");
	}
	
	//根据条形码查找商品
	$scope.findGoods =function(){
		var addGood = findThing($scope.addBarCode,$scope.commodity);
		if(addGood){
			$scope.addName = addGood.name;
			$scope.addCategory = addGood.category;
		}
	}
})

app.directive('ngBlur', function($parse){
	  return function(scope, element, attr){
	    var fn = $parse(attr['ngBlur']);
	    $(element).on('focusout', function(event){
	      fn(scope, {$event: event});
	    });
	  }
});
