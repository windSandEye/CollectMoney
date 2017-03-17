var app = angular.module('accountApp', []);
app.controller('accountCtrl', function($scope, $http, $rootScope) {
	$http.get("./data/accountdetail.json")
		.success(function(response) {
			$scope.goods = response.accountDetail; //初始化的列表信息

			if(window.localStorage.discountArrList) { //更新初始化数据的价格
				var disList = JSON.parse(window.localStorage.discountArrList);
				var goodthi = $scope.goods;
				for(var x = 0; x < disList.length; x++) {
					for(var y = 0; y < goodthi.length; y++) {
						if(disList[x].barCode == goodthi[y].barCode) {
							goodthi[y].price = disList[x].price;
						}
					}
				}
			}
		});

	$http.get("./data/goodslist.json")
		.success(function(response) {
			$scope.commodity = response;
		});

	//变量定义:
	$scope.totalMoney = 0; //结账总数
	$scope.totalGoods = []; //不重复的商品清单
	$scope.discountGoods = []; //95折商品(specialOffer : "2")
	$scope.giveGoods = []; //买2送一商品(specialOffer : "1")
	$scope.saveTotalMoney = 0; //总共节省钱数
	$scope.isDiscount = false; //是否含有打折商品
	$scope.isGive = false; //是否含有买2商品

	$scope.addGoods = {
		number: 1
	}; //添加商品
	$scope.addBarCode = ""; //添加商品的条形码

	$scope.barCodeArr = []; //条形码列表

	//数量加1
	$scope.addNum = function(index) {
		$scope.goods[index].number += 1;
	}

	//数量减1
	$scope.reduceNum = function(index) {
		if($scope.goods[index].number > 1) {
			$scope.goods[index].number -= 1;
		}
	}

	//删除该物品
	$scope.deleteThing = function(index) {
		$scope.goods.splice(index, 1);
	}

	//生成条形码
	$scope.generateBarCode = function() {
		var goods = $scope.goods;
		var barCodeArr = [];
		for(var j = 0; j < goods.length; j++) {
			if(goods[j].number == 1) {
				barCodeArr.push(goods[j].barCode);
			} else if(goods[j].number > 1) {
				barCodeArr.push(goods[j].barCode + "-" + goods[j].number);
			}
		}
		$scope.barCodeArr = barCodeArr;
	}

	//结账
	$scope.countMoney = function() {
		$scope.generateBarCode(); //生成条形码
		//遍历条形码生成账单
		var goods = [];
		var barCodeList = $scope.barCodeArr;
		for(var n = 0; n < barCodeList.length; n++) {
			var barCode2 = barCodeList[n].split("-");
			var goodsThing = findThing(barCode2[0], $scope.commodity);
			if(goodsThing) {
				if(window.localStorage.discountArrList) {
					var discountArrList = JSON.parse(window.localStorage.discountArrList);
					var goodsThing1 = findThing(barCode2[0], discountArrList);
					if(goodsThing1) {
						goodsThing.price = goodsThing1.price;
						goodsThing.specialOffer = goodsThing1.specialOffer;
					}
				}
				var newObject = {
					barCode: goodsThing.barCode,
					name: goodsThing.name,
					unit: goodsThing.unit,
					price: goodsThing.price,
					category: goodsThing.category,
					specialOffer: goodsThing.specialOffer
				}
				if(barCode2[1]) {
					newObject.number = parseInt(barCode2[1]);
				} else {
					newObject.number = 1;
				}
				goods.push(newObject);
			}
		}

		//将商品去重
		var noRepeatArr = repeatThing(goods);
		//统计商品数量
		for(var i = 0; i < noRepeatArr.length; i++) {
			for(var j = 0; j < goods.length; j++) {
				if(noRepeatArr[i].barCode == goods[j].barCode) {
					noRepeatArr[i].number = noRepeatArr[i].number + goods[j].number;
				}
			}
		}

		//统计商品价钱
		for(var m = 0; m < noRepeatArr.length; m++) {
			if(noRepeatArr[m].specialOffer == "1") { //买2赠一
				if(noRepeatArr[m].number >= 3) {
					noRepeatArr[m].subtotal = (noRepeatArr[m].number - 1) * noRepeatArr[m].price;
					$scope.isGive = true;
					var giveGood = {
						name: noRepeatArr[m].name,
						number: 1,
						unit: noRepeatArr[m].unit
					}
					$scope.giveGoods.push(giveGood);
				} else {
					noRepeatArr[m].subtotal = noRepeatArr[m].number * noRepeatArr[m].price;
				}

			} else if(noRepeatArr[m].specialOffer == "2") { //95折
				var totalMoney = noRepeatArr[m].number * noRepeatArr[m].price;
				noRepeatArr[m].subtotal = noRepeatArr[m].number * noRepeatArr[m].price * 0.95; //小计
				noRepeatArr[m].saveMoney = totalMoney - noRepeatArr[m].subtotal;
				$scope.isDiscount = true;
				var discount = {
					name: noRepeatArr[m].name,
					number: 1,
					unit: noRepeatArr[m].unit
				}
				$scope.discountGoods.push(discount);
				$scope.saveTotalMoney += noRepeatArr[m].saveMoney; //节省
			} else { //不打折
				noRepeatArr[m].subtotal = noRepeatArr[m].number * noRepeatArr[m].price; //小计
			}

			$scope.totalMoney += noRepeatArr[m].subtotal; //总计
		}
		$scope.totalGoods = noRepeatArr; //账单列表
	}

	//根据条形码查找商品
	$scope.findGoods = function() {
		var addGood = findThing($scope.addBarCode, $scope.commodity);
		if(addGood) {
			addGood.number = 1;
			$scope.addGoods = addGood;
		}
	}

	$scope.addGoodThing = function() {
		if($scope.addGoods) {
			$scope.goods.push($scope.addGoods);
		}
	}
})
app.directive('ngBlur', function($parse) {
	return function(scope, element, attr) {
		var fn = $parse(attr['ngBlur']);
		$(element).on('focusout', function(event) {
			fn(scope, { $event: event });
		});
	}
});

//对数组去重
function repeatThing(goods) {
	var noRepeat = []; //不重复的零时数组
	var isRepeat = {}; //一个hash表用于记录数据是否重复
	if(goods && goods.length > 0) {
		for(var i = 0; i < goods.length; i++) {
			var barCode = goods[i].barCode;
			if(!isRepeat[barCode]) { //如果hash表中不存在该数据
				isRepeat[barCode] = true;
				var thing = {
					barCode: goods[i].barCode,
					name: goods[i].name,
					number: 0,
					unit: goods[i].unit,
					price: goods[i].price,
					category: goods[i].category,
					specialOffer: goods[i].specialOffer
				}
				noRepeat.push(thing);
			}
		}
	}
	return noRepeat;
}