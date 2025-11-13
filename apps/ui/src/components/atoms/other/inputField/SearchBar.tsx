import BaseTextField from './BaseTextField';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import InputAdornment from '@mui/material/InputAdornment';
import { useDispatch, useSelector } from 'react-redux';
import {search_txt} from '../../../../store/slices/SearchBarSlice';

const SearchBar = ({searchBy}:{searchBy?:string}) => {
  searchBy=searchBy===undefined ? "" : searchBy;
    const dispatch = useDispatch();
    const searchText = useSelector(
        (state: any) => state.searchBar.searchText
      );
  return (
    <BaseTextField
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlinedIcon />
            </InputAdornment>
          ),
        },
      }}
        placeholder={`Search by ${searchBy}`}
        value={searchText}
        onChange={(e) => {dispatch(search_txt(e.target.value))}}

    />
  );
};

export default SearchBar;