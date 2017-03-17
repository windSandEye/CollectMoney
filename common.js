
//根据条形码查找商品
function findThing(barCode,commodity){
	if(commodity && commodity.length>0){
		for(var i=0;i<commodity.length;i++){
			if(commodity[i].barCode == barCode){
				return commodity[i];
			}
		}
	}
	return null;
}
