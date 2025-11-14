import BaseTextField from './BaseTextField';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import InputAdornment from '@mui/material/InputAdornment';
import { useDispatch, useSelector } from 'react-redux';
import React from 'react';

const SearchBar = ({searchBy}:{searchBy?:string}) => {
  searchBy=searchBy===undefined ? "" : searchBy;
    const dispatch = useDispatch();
    const searchText = useSelector(
        (state: { searchBar: { searchText: string } }) => state.searchBar.searchText
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
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          dispatch({ type: 'searchBar/search_txt', payload: e.target.value });
        }}
    />
  );
};

export default SearchBar;